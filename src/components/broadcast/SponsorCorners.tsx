type SponsorCornersProps = {
  topLeftImage: string | null;
  topRightImage: string | null;
};

const LOGO_CLASS =
  'pointer-events-none h-36 w-auto max-w-[340px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.95),0_6px_24px_rgba(0,0,0,0.75)]';

export function SponsorCorners({ topLeftImage, topRightImage }: SponsorCornersProps) {
  return (
    <>
      {topLeftImage && <img src={topLeftImage} alt="Sponsor logo" className={`absolute left-16 top-10 ${LOGO_CLASS}`} />}
      {topRightImage && <img src={topRightImage} alt="Sponsor logo" className={`absolute right-16 top-10 ${LOGO_CLASS}`} />}
    </>
  );
}
