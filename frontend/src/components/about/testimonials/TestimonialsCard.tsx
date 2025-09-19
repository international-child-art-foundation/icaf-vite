import { Testimonial } from '@/data/about/testimonials';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { QuoteIcon } from '@/assets/shared/icons/QuoteIcon';

export const TestimonialCard = ({
  testimonial,
  active,
}: {
  testimonial: Testimonial;
  active: boolean;
}) => {
  return (
    <div className="relative flex h-[450px] items-center 2xl:h-[550px]">
      <Card
        className={`mx-auto h-[400px] w-[300px] items-center gap-4 rounded-[40px] p-6 shadow-md transition-all duration-300 xl:w-[360px] xl:px-10 2xl:h-[490px] 2xl:w-[390px] 2xl:px-12 ${active ? 'scale-100' : 'scale-90'}`}
      >
        {/* Card Content  */}
        <CardHeader className="mb-2 items-center gap-0 px-0">
          <Avatar className="mx-auto mb-4 h-16 w-16 md:h-20 md:w-20 2xl:mb-6">
            <AvatarImage src={testimonial.image} alt={testimonial.name} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <CardTitle className="mb-2 text-center font-sans 2xl:mb-2">
            {testimonial.name}
          </CardTitle>
          <CardDescription className="text-center font-sans font-light">
            {testimonial.title}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 font-sans font-normal text-gray-900">
          <QuoteIcon className="mx-auto mb-2" />
          {testimonial.quote}
        </CardContent>
      </Card>
    </div>
  );
};
