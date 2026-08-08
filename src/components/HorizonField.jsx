/* Purely decorative backdrop: the sun sitting under the fold plus three slow
   drifting blobs. Kept out of the app tree's flow so it never affects layout. */
export default function HorizonField() {
  return (
    <>
      <div className="horizon-field" aria-hidden="true">
        <div className="drift drift-a" />
        <div className="drift drift-b" />
        <div className="drift drift-c" />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
