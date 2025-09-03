import DesignersImage from '@/assets/team/DesignersImage.webp';

export const DesignersSmall = () => {
  return (
    <div>
      <div></div>
    </div>
  );
};

export const DesignersLarge = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-[40px] font-bold">ICAF Team</p>
      <div className="h-[900px]">
        <div className="grid h-[700px] grid-cols-2 overflow-hidden rounded-[40px] shadow-[0px_4px_17px_0px_rgba(21,20,20,0.1)]">
          <div className="p-12">Designers</div>
          <div>
            <img
              src={DesignersImage}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
