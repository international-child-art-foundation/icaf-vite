export const ArtworkDisclaimer = () => {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-slate-700">
      <p>
        Artwork information submitted here will become public as soon as it is
        accepted for the ICAF gallery. This can include the artwork image,
        title, description, artist first name, age, country, and region.
      </p>
      <p>
        <span className="font-bold">
          Do not include any information about your child that you do not want
          published.
        </span>{' '}
        If your child offers a title or description, make sure it does not
        include any information you would not like to display in our public
        gallery.
      </p>
    </section>
  );
};
