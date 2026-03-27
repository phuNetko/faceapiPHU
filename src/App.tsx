import './App.css'
import FaceDetection from './faceapi/FaceDetection'
import { ModelBase } from './components/model/modelbase'
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { setIsOpenVideo } from './store/statusSlice';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

function App() {
  const isOpen = useSelector((state: RootState) => state.statusApp.isOpenVideo);
  const [isRegister, setIsRegister] = useState(false);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50 flex flex-col items-center justify-center px-4 py-8">
      <ModelBase isOpen={isOpen} setIsOpen={() => dispatch(setIsOpenVideo(false))}>
        <FaceDetection isRegister={isRegister} />
      </ModelBase>

      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-100/80 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-md mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Face Recognition System
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Nhận diện khuôn mặt
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-sm mx-auto">
          Đăng ký hoặc xác thực danh tính bằng khuôn mặt
        </p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={() => {
            dispatch(setIsOpenVideo(true));
            setIsRegister(true);
          }}
          className="flex-1 group bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 hover:scale-[1.02] text-left"
        >
          <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center sm:mb-3 shrink-0 group-hover:bg-white/30 transition-colors">
              <FaUserPlus className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Đăng ký</h3>
              <p className="text-indigo-200 text-xs mt-0.5">Thêm khuôn mặt mới</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            dispatch(setIsOpenVideo(true));
            setIsRegister(false);
          }}
          className="flex-1 group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] text-left"
        >
          <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center sm:mb-3 shrink-0 group-hover:bg-white/30 transition-colors">
              <FaSearch className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Xác thực</h3>
              <p className="text-emerald-200 text-xs mt-0.5">Nhận diện khuôn mặt</p>
            </div>
          </div>
        </button>
      </div>

      <p className="text-slate-400 text-[11px] mt-6">
        Dữ liệu lưu trữ cục bộ trên trình duyệt
      </p>
    </div>
  )
}

export default App
