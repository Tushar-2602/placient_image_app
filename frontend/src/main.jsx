import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from '../components/Layout'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Landing_page from '../components/Landing_page'
import PlacientAuthPage from '../components/Login_signup'
import Pannel from '../components/Channel_pannel'
import Channel_page from '../components/Channel_page'
import Video_page from '../components/Video_page'
import S3Uploader from '../components/test_upload'
import Previous_bought from '../components/Previous_bought'
import { Redirect } from '../components/Redirect'
const router =createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Landing_page/>}/>
      <Route path='signup' element={<PlacientAuthPage/>}/>
      <Route path='channel/:channel_name' element={<Pannel/>}/>
      <Route path='user/channel/:channel_id' element={<Channel_page/>}/>
      <Route path='video/:content_id' element={<Video_page/>}/>
      <Route path='user/previous_bought' element={<Previous_bought/>}/>
      <Route path='test' element={<S3Uploader/>}/>
      <Route path='*' element={<Redirect/>}/>
    </Route>
  )
)
createRoot(document.getElementById('root')).render(
 
    <RouterProvider router={router}/>

)
