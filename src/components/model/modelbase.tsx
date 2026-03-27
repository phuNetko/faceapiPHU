export const ModelBase = ({ children, isOpen, setIsOpen }: { children: React.ReactNode, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="w-full max-w-[460px] animate-[scaleIn_0.25s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};
