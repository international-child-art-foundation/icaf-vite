// components/shared/TestimonialBlock.tsx

export default function TestimonialBlock() {
  return (
    <section className="relative mx-auto my-16 w-full max-w-screen-2xl px-8 md:px-12 lg:px-24 xl:px-28 2xl:px-32">
      {/* Testimonial Card */}
      <div className="relative z-10 rounded-3xl bg-white px-6 py-12 shadow-lg md:px-28 md:py-16">
        {/* left quote */}
        <span className="absolute left-6 top-10 select-none font-serif text-9xl leading-none text-blue-600">
          “
        </span>

        {/* right quote*/}
        <span className="absolute bottom-0 right-6 translate-y-12 select-none font-serif text-9xl leading-none text-blue-600">
          ”
        </span>

        <div className="flex flex-col items-center text-center">
          {/* Teacher Librarian logo circle */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-xs font-bold leading-tight text-white">
            teacher
            <br />
            librarian
          </div>

          {/* Heading */}
          <h3 className="mb-4 text-base font-bold text-gray-900 md:text-lg">
            Teacher Librarian: The Journal for School Library Professionals.
          </h3>

          {/* Paragraph */}
          <p className="text-left text-sm leading-relaxed text-gray-800 md:text-base">
            The International Child Art Foundation publishes ChildArt … that
            fosters learning, self-discovery, and global education for children
            through all types of art and design projects and activities. Vibrant
            color illustrations and photographs show art created by children and
            illustrate step-by-step craft projects from around the world that
            can be done in the classroom. Teacher-librarians will find ChildArt
            to be an excellent source for creative multi-cultural projects to
            recommend to teachers and students.
          </p>
        </div>
      </div>
    </section>
  );
}
