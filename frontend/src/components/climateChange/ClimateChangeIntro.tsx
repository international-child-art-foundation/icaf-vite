import { linkClasses } from '@/data/linkClasses';

export const ClimateChangeIntro = () => {
  return (
    <div>
      <p>
        {' '}
        ICAF promotes young people’s hands-on work in creating a sustainable
        ecosystem. The{' '}
        <a href="https://worldchildrensfestival.org/" className={linkClasses}>
          World Children’s Festival
        </a>{' '}
        opens with{' '}
        <a
          href="https://worldchildrensfestival.org/health-and-environment-day"
          className={linkClasses}
        >
          {' '}
          Health & Environment Day
        </a>
        , where children host workshops for peer learning and collaboratively
        produce murals on the environment.{' '}
      </p>
      <p>
        See{' '}
        <a
          href="/ChangingEnvironment"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {' '}
          ChildArt magazine's
        </a>{' '}
        climate change issue.
      </p>
    </div>
  );
};
