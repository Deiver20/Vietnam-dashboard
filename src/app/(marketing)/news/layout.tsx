/* @modal is a parallel-route slot: the intercepted /news/article/:id renders
   there as a dialog OVER the feed (soft navigation), while the feed itself
   stays mounted underneath — filters and scroll survive. */
export default function NewsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
