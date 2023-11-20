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

Route.get('/', async ({view}) => {
  const posts = await Database.from('blog').select('*').orderBy('id', 'desc').limit(10);
  const hashedPassword = await Hash.make("password")
  console.log(hashedPassword)
  if (await Hash.verify(hashedPassword, "passwodrd")) {
    console.log("Password is valid")
  }

 return view.render('index', {posts})
})

Route.get('/post/:id', async ({view, params}) => {
  const post = await Database.from('blog').select('*').where('id', params.id).first();
  return view.render('post', {post})
});

Route.get('/admin/post/create', async ({view}) => {
 return view.render('admin_post_create')
})

Route.post('/admin/post/create', async ({ request, view }) => {
  if(request.input('title') === undefined ||
      request.input('teaser') === undefined ||
     request.input('text') === undefined ||
     request.input('author') === undefined){
    return 'Fehler!'
  }
  if(request.input('title') === null ||
     request.input('teaser') === null||
	 request.input('text') === null||
     request.input('author') === null){
    return 'Da wurde etwas vergessen'
  }
  const result = await Database
              .table('blog')
              .insert({ title: request.input('title'), 
                   teaser: request.input('teaser'),
                text: request.input('text'), 
                author: request.input('author')})
    return view.render('admin_post_create_result', {result})
});
