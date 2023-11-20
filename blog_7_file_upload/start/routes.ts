/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database';
import Hash from '@ioc:Adonis/Core/Hash'
import { v4 as uuidv4 } from 'uuid';


Route.get('/', async ({view, session}) => {
 const posts = await Database.from('blog')
                             .join('blog_user', 'blog.author', 'blog_user.id')
                             .select('blog.id', 'blog.title', 'blog.teaser', 'blog.text', 'blog.date', 'blog_user.firstname', 'blog_user.lastname')
                             .orderBy('blog.date', 'desc')
                             .limit(10);

 return view.render('index', {posts, user: session.get('user'), pageTitle: 'Home'})
})

Route.get('/about', async ({view, session}) => {
  return view.render('about', {user: session.get('user'), pageTitle: 'Über uns'})
})


Route.get('/post/:id', async ({view, params, session}) => {
   const post = await Database.from('blog')
                             .join('blog_user', 'blog.author', 'blog_user.id')
                             .select('blog.id', 'blog.title', 'blog.teaser', 'blog.text', 'blog.date','blog.image', 'blog_user.firstname', 'blog_user.lastname')
                             .where('blog.id', params.id)
                             .orderBy('blog.date', 'desc')
                             .first();
  if(post === null){
    return view.render('404')
  }
  return view.render('post', {post:post, pageTitle: post.title, user: session.get('user')})
});

Route.get('/admin/logout', async ({session, response}) => {
session.forget('user');
 return response.redirect('/')
})

Route.get('/admin/post/create', async ({view, session, response}) => {
    if(session.get('user') === undefined){
    return response.redirect('/admin/login')
  }
 return view.render('admin_post_create',{ pageTitle: 'Post erstellen'})
})

Route.get('/admin/login', async ({view}) => {
 return view.render('admin_login', { pageTitle: 'Anmeldung'})
})


Route.post('/admin/login', async ({ request, view, response, session }) => {
  if(request.input('login') === undefined ||
      request.input('password') === undefined ){
    return view.render('admin_login', {error: 'Formular-Fehler', pageTitle: 'Anmeldung - Fehler'})
  }
 if(request.input('login') === null ||
      request.input('password') === null ){
    return view.render('admin_login', {error: 'Bitte Felder ausfüllen', pageTitle: 'Anmeldung - Fehler'})
  }
  const result =await Database
                .from('blog_user')
                .select('*')
                .where('login', request.input('login'))
                .first();
  if (await Hash.verify(result.password, request.input('password'))) {
    console.log("login erfolgreich!");
    const user =  {
      id: result.id,
      login: result.login,
      firstname: result.firstname,
      lastname: result.lastname
    }
    session.put('user', user)
    return response.redirect('/')
  }
  return view.render('admin_login', {error: 'Nutzer unbekannt oder Passwort falsch'})
});

Route.post('/admin/post/create', async ({ request, view, session, response }) => {
  if(session.get('user') === undefined){
    return response.redirect('/admin/login')
  }
  if(request.input('title') === undefined ||
      request.input('teaser') === undefined ||
     request.input('text') === undefined ||
     request.file('image') === undefined) {
    return 'Fehler!'
  }
  if(request.input('title') === null ||
     request.input('teaser') === null||
	   request.input('text') === null ||
     request.file('image')=== null){
    return 'Da wurde etwas vergessen'
  }

  const fileName = uuidv4()+'.'+request.file('image')?.extname;
  await request.file('image')?.move('./public/images/', { name: fileName})
  
  const result =await Database
                .table('blog')
                .insert({ title: request.input('title'), teaser: request.input('teaser'),text: request.input('text'), author: session.get('user').id, image: fileName});
  
                return view.render('admin_post_create_result', {result,  pageTitle: 'Post erstellen'})
});

Route.get('/post/:id/edit', async ({view, params, session, response}) => {
    if(session.get('user') === undefined){
      return response.redirect('/admin/login')
    }
   const post = await Database.from('blog').where('blog.id', params.id).first();
  if(post === null){
    return view.render('404')
  }
  return view.render('edit', {post:post, pageTitle: 'editieren: '+post.title, user: session.get('user')})
});


Route.post('/post/:id/edit', async ({view, params, session, response, request}) => {
    if(session.get('user') === undefined){
      return response.redirect('/admin/login')
    }
   const post = await Database.from('blog').where('blog.id', params.id).update({ title: request.input('title'), teaser: request.input('teaser'),text: request.input('text'), author: session.get('user').id});
  console.log(post)
   if(post != 1){
    return view.render('404')
  }
  return response.redirect('/post/'+params.id)
});