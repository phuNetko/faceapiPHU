import './App.css'
import FaceDetection from './faceapi/FaceDetection'
import { ModelBase } from './components/model/modelbase'
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  return (
    <div className='w-full h-full mt-10'>
      <ModelBase isOpen={isOpen} setIsOpen={setIsOpen}>
        <FaceDetection isOpen={isOpen} isRegister={isRegister} />
      </ModelBase>
      <div className='flex justify-center items-center gap-4'>
        <button onClick={() => {
          setIsOpen(true);
          setIsRegister(true);
        }} className='bg-blue-500 text-white font-bold p-2  px-4 cursor-pointer rounded-md flex justify-center items-center '>Register</button>
        <button onClick={() => {
          setIsOpen(true);
          setIsRegister(false);
        }} className='bg-blue-200 text-black font-bold p-2 px-4 cursor-pointer rounded-md flex justify-center items-center '>Compare</button>
      </div>
    </div>
  )
}

export default App
