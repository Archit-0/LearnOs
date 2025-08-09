import React from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../../Api/api'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { Settings } from 'lucide-react'
const LogoutBtn = () => {
  const dispath = useDispatch();
  const navigate = useNavigate()
  const addEvent = () => {
    try {
      const event = apiService.logout()
      if (event) {
        dispath(logout());
        navigate('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <button
      className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30 hover:border-red-400"
      onClick={addEvent}
    >
      <Settings className="w-4 h-4" />
      <span>Logout</span>
    </button>
  )
}

export default LogoutBtn