import { BrowserRouter } from 'react-router-dom'
import BaseRoutes from './Routes'
import { useDispatch, useSelector } from 'react-redux'
import BaseHeader from './Components/BaseHeader'
import { useEffect } from 'react'
import { getActiveRole, getAuthUser } from './utils'
import { loginSuccess } from './redux/slices/userSlice'

function App() {

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
 const role =  getActiveRole() 

  useEffect(() => {
    if (!user) {
      const localUser = getAuthUser(role);
      if (localUser) {
        dispatch(loginSuccess(localUser));
      }
    }
  }, [user]);

  return (
    <>
      <BrowserRouter>
        <BaseHeader />
        <BaseRoutes user={user} />
      </BrowserRouter>
    </>
  )
}

export default App