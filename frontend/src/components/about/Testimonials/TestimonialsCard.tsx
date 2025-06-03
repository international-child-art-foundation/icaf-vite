import { Testimonial } from '@/lib/testimonials';
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
}: {
  testimonial: Testimonial;
}) => {
  return (
    <div className="flex h-[450px] items-center 2xl:h-[600px]">
      {/*px between cards here*/}
      <Card className="h-[400px] w-[300px] items-center gap-4 rounded-[40px] p-6 shadow-md md:p-8 2xl:h-[490px] 2xl:w-[390px]">
        <CardHeader className="items-center gap-0 px-0">
          <Avatar className="mx-auto mb-4 h-16 w-16 2xl:mb-6 2xl:h-20 2xl:w-20">
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
          <QuoteIcon className="mx-auto md:mb-2" />
          {testimonial.quote}
        </CardContent>
      </Card>
    </div>
  );
};
