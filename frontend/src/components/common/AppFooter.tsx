import "../../styles/footer-styles.css";

const AppFooter = () => {
  return (
    <>
      {/* Subtle powered by caption */}
      <div className="flex justify-center pb-8 mt-16">
        <p className="text-xs siri-text-subtle text-center tracking-wide opacity-60">
          Powered by{" "}
          <span className="text-gradient font-medium">Google ADK</span>
          <span className="heart-icon mx-2">❤</span>
        </p>
      </div>
    </>
  );
};

export default AppFooter;
