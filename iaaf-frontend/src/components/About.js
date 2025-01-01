function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About World Athletics Points Conversion</h1>
        
        <section className="about-section">
          <h2>What is World Athletics Points?</h2>
          <p>
            World Athletics Points (formerly IAAF Points) is a scoring system used in athletics (track and field) 
            to compare performances across different events. This system allows for the comparison of performances 
            in different events on a standardized scale.
          </p>
        </section>

        <section className="about-section">
          <h2>How it Works</h2>
          <p>
            The scoring system uses mathematical formulas that take into account world records and the general 
            progression of performances in each event. Each performance is converted into points, making it 
            possible to compare achievements across different events and conditions.
          </p>
        </section>

        <section className="about-section">
          <h2>Competition Levels</h2>
          <p>
            The competition level system adds bonus points based on the importance of the meet and the athlete's 
            placement. This ranges from small local meets to Olympic Games and World Championships, providing 
            additional recognition for performances in high-level competition.
          </p>
        </section>

        <section className="about-section">
          <h2>Wind Modifications</h2>
          <p>
            For certain events (sprints, hurdles, long jump, and triple jump), wind conditions affect the scoring. 
            Headwinds result in additional points being awarded, while strong tailwinds (above +2.0 m/s) result 
            in point deductions.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About; 