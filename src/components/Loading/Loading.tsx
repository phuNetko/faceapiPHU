import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
const Loading = () => {
    const isLoading = useSelector((state: RootState) => state.statusApp.isLoading);
    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-[#e2dede1c] z-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
        </>
    );
};

export default Loading;