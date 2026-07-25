type SponsorCornersProps = {
  topRightImage: string | null;
};

export const SPONSOR_LOGO_CLASS =
  'pointer-events-none h-36 w-auto max-w-[340px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.95),0_6px_24px_rgba(0,0,0,0.75)]';

export function SponsorCorners({ topRightImage }: SponsorCornersProps) {
  return (
    <>
      {topRightImage && (
        <img
          src={topRightImage}
          alt="Sponsor logo"
          className={`absolute right-16 top-10 ${SPONSOR_LOGO_CLASS}`}
        />
      )}
    </>
  );
}
