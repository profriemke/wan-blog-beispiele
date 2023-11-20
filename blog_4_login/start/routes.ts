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


Route.get('/', async ({view, session}) => {
 const posts = await Database.from('blog')
                             .join('blog_user', 'blog.author', 'blog_user.id')
                             .select('blog.id', 'blog.title', 'blog.teaser', 'blog.text', 'blog.date', 'blog_user.firstname', 'blog_user.lastname')
                             .orderBy('blog.date', 'desc')
                             .limit(10);

 return view.render('index', {posts, user: session.get('user')})
})

Route.get('/post/:id', async ({view, params}) => {
   const post = await Database.from('blog')
                             .join('blog_user', 'blog.author', 'blog_user.id')
                             .select('blog.id', 'blog.title', 'blog.teaser', 'blog.text', 'blog.date', 'blog_user.firstname', 'blog_user.lastname')
                             .where('blog.id', params.id)
                             .orderBy('blog.date', 'desc')
                             .first();
  if(post === null){
    return view.render('404')
  }
  return view.render('post', {post:post})
});

Route.get('/admin/logout', async ({session, response}) => {
session.forget('user');
 return response.redirect('/')
})

Route.get('/admin/post/create', async ({view, session, response}) => {
    if(session.get('user') === undefined){
    return response.redirect('/admin/login')
  }
 return view.render('admin_post_create')
})

Route.get('/admin/login', async ({view}) => {
 return view.render('admin_login')
})
Route.post('/admin/login', async ({ request, view, response, session }) => {
  if(request.input('login') === undefined ||
      request.input('password') === undefined ){
    return view.render('admin_login', {error: 'Formular-Fehler'})
  }
 if(request.input('login') === null ||
      request.input('password') === null ){
    return view.render('admin_login', {error: 'Bitte Felder ausfüllen'})
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
     request.input('text') === undefined) {
    return 'Fehler!'
  }
  if(request.input('title') === null ||
     request.input('teaser') === null||
	 request.input('text') === null){
    return 'Da wurde etwas vergessen'
  }
  const result =await Database
                .table('blog')
                .insert({ title: request.input('title'), teaser: request.input('teaser'),text: request.input('text'), author: session.get('user').id})
    return view.render('admin_post_create_result', {result})
});
