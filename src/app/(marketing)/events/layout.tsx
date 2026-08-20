/* @modal is a parallel-route slot: the intercepted /events/event/:id renders
   there as a dialog OVER the calendar (soft navigation) while the page stays
   mounted underneath — filters and scroll survive. */
export default function EventsLayout({
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
