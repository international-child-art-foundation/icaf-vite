import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <>
      <div className="px-6 gap-6 py-6 sm:px-8 lg:mx-auto md:px-12 lg:px-16 xl:px-20 max-w-screen-2xl w-full font-body z-20 shadow-md h-fit relative content-center">
        <div className="px-4 mx-auto flex flex-row gap-4 items-center justify-between">
          <Button size="lg">
            <Link to="/gallery">Go to Gallery</Link>{" "}
          </Button>
          <Link to="/">
            <ICAFlogo />
          </Link>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
