import './App.css'
import FaceCapture from './faceapi/FaceCapture'
import FaceCompare from './faceapi/FaceCompare'

function App() {

  return (
    <>
      {/* <FaceRecognition /> */}
      <FaceCapture />
      <FaceCompare />
    </>
  )
}

export default App
