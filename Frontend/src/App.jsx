import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import { useNavigate } from 'react-router-dom'
import { loginSuccess, logout } from './store/authSlice.js'
import { Outlet } from 'react-router-dom'
import apiService from './Api/api.js'
import { Header } from './components'
import Chatbot from './components/chatbot/Chatbot.jsx'


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getMe().then((userData) => {
        if (userData) {
          dispatch(loginSuccess(userData))
        } else {
          dispatch(logout())
          navigate('/login')
        }
      }).finally(setloading(false))
    } else {
      navigate('/login')
    }
  }, [navigate]);

  // const user = useSelector((state) => state.auth.isAuthenticated);
  // console.log("user at app: ", user)

  return (
    !loading && (<div>
      <Header />
      <Outlet />
      <Chatbot />
    </div>)

  )
}


export default App
