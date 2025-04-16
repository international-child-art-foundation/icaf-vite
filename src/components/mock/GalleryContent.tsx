import { IGalleryContent } from "@/shared/types/mock-db";

export const GalleryContent = ({ artworks }: { artworks: IGalleryContent }) => {
  return (
    <div>
      {artworks?.length &&
        artworks.map((art) => {
          return <div>{art.f_name}</div>;
        })}
    </div>
  );
};
