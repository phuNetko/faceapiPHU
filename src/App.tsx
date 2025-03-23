import './App.css'
import FaceDetection from './faceapi/FaceDetection'
import { ModelBase } from './components/model/modelbase'
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { setIsOpenVideo } from './store/statusSlice';
function App() {
  const isOpen = useSelector((state: RootState) => state.statusApp.isOpenVideo);
  const [isRegister, setIsRegister] = useState(false);
  const dispatch = useDispatch();
  return (
    <div className='w-full h-full mt-10'>
      <ModelBase isOpen={isOpen} setIsOpen={() => dispatch(setIsOpenVideo(!isOpen))}>
        <FaceDetection isRegister={isRegister} />
      </ModelBase>
      <div className='flex justify-center items-center gap-4'>
        <button onClick={() => {
          dispatch(setIsOpenVideo(true));
          setIsRegister(true);
        }} className='bg-blue-500 text-white font-bold p-2  px-4 cursor-pointer rounded-md flex justify-center items-center '>Register</button>
        <button onClick={() => {
          dispatch(setIsOpenVideo(true));
          setIsRegister(false);
        }} className='bg-blue-200 text-black font-bold p-2 px-4 cursor-pointer rounded-md flex justify-center items-center '>Compare</button>
      </div>
    </div>
  )
}

export default App
