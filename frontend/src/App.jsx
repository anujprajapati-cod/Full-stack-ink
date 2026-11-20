import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Authform from './pages/Authform'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Addblog from './pages/Addblog'
import Blogpage from './pages/blogpage'
import Editblog from './pages/Editblog'
import Profile from './pages/Profile'
import Savedblogs from './pages/Savedblogs'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (

    <>
    <Toaster />
    <Routes>
   
      <Route path="/" element={<Navbar />}>

        
        <Route index element={<Home />} />

        
        <Route
          path="signin"
          element={<Authform type="signin" />}
        />

        
        <Route
          path="signup"
          element={<Authform type="signup" />}
        />

        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />



        <Route
          path="blogs"
          element={<Addblog />}
        />

        <Route
          path="blogs/:blogId/edit"
          element={<Editblog />}
        />

        <Route
          path="blogs/:blogId"
          element={<Blogpage />}
        />

        <Route path="profile" element={<Profile />} />
        <Route path="saved" element={<Savedblogs />} />

      </Route>

    </Routes>
    </>
  )
}

export default App
