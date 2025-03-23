export const ModelBase = ({ children, isOpen, setIsOpen }: { children: React.ReactNode, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
    return (
        <>
           {isOpen && <div className="w-full h-full flex justify-center items-center fixed top-0 left-0 z-20 bg-black/30 flex-col gap-3" onClick={() => {
            setIsOpen(false);
           }}>
                <div onClick={(e) => e.stopPropagation()}>{children}</div> 
            </div>}
        </>
    );
};
