import { Button } from '../ui/button';

export default function WFCCTA() {
  return (
    <section className="mx-4 my-16">
      <div className="flex h-[400px] items-center rounded-3xl bg-[#2057CC24]">
        {/**Content Container */}
        <div className="flex flex-col px-4">
          <h2 className="font-montserrat mb-2 text-3xl font-extrabold">
            Be Part of the Movement
          </h2>
          <p className="my-4 font-sans text-xl font-normal">
            {' '}
            The 7th World Children's Festival is coming in June 2026. Join us in
            Washington, D.C, to experience the power of creativity, empathy, and
            leadership in action.
          </p>
          <a
            href="https://worldchildrensfestival.org/"
            target="blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              className="h-14 w-[225px] rounded-full text-base font-semibold 2xl:w-[270px]"
            >
              Get Involved
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
