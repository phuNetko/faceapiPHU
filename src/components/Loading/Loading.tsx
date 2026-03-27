import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const Loading = () => {
    const isLoading = useSelector((state: RootState) => state.statusApp.isLoading);
    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-[9999]">
                    <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-600 text-sm">Đang xử lý...</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default Loading;
