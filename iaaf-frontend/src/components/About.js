function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About World Athletics Points Conversion</h1>
        
        <section className="about-section">
          <h2>What is World Athletics Points?</h2>
          <p>
            World Athletics Points is a scoring system used in athletics (track and field) 
            to compare performances across different events. This system allows for the comparison of performances 
            in different events on a standardized scale, making it possible to evaluate achievements across diverse 
            disciplines within athletics.
          </p>
          <p>
            The scoring tables are regularly updated to reflect current world records and performance standards. 
            The current scoring tables were last updated in 2022, incorporating new world records and performance trends.
          </p>
        </section>

        <section className="about-section">
          <h2>How it Works</h2>
          <p>
            The scoring system uses mathematical formulas that take into account world records and the general 
            progression of performances in each event. Each performance is converted into points, typically ranging 
            from 0 to approximately 1400 points.
          </p>
          <p>
            The formulas consider:
          </p>
          <ul>
            <li>The type of event (track, field, or combined events)</li>
            <li>Gender-specific standards</li>
            <li>Indoor vs outdoor conditions</li>
            <li>Technical differences between events</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Competition Levels</h2>
          <p>
            The World Athletics Ranking System includes both performance points and placing points. The placing 
            points vary based on the competition category:
          </p>
          <ul>
            <li><strong>OW</strong> - Olympic Games, World Championships </li>
            <li><strong>DF</strong> - Diamond League Final </li>
            <li><strong>GW</strong> - Gold Level World Athletics Events </li>
            <li><strong>GL</strong> - Diamond League Meetings </li>
            <li><strong>A</strong> - Category A Competitions </li>
            <li><strong>B</strong> - Category B Competitions </li>
            <li><strong>C</strong> - Category C Competitions </li>
            <li><strong>D</strong> - Category D Competitions </li>
            <li><strong>E</strong> - Category E Competitions </li>
            <li><strong>F</strong> - Category F Competitions </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Wind Modifications</h2>
          <p>
            For certain events (sprints, hurdles, long jump, and triple jump), wind conditions affect the scoring. 
            The modifications are applied as follows:
          </p>
          <ul>
            <li>Headwinds result in additional points being awarded</li>
            <li>Tailwinds above +2.0 m/s result in point deductions</li>
            <li>Wind between 0 and +2.0 m/s has no effect on points</li>
            <li>The magnitude of adjustment increases with stronger winds</li>
          </ul>
          <p>
            Wind adjustments ensure fair comparison of performances achieved under different conditions.
          </p>
        </section>

        <section className="about-section">
          <h2>Using the Calculator</h2>
          <p>
            This tool offers two main functions:
          </p>
          <ul>
            <li><strong>Performance → Points:</strong> Convert an athletic performance into World Athletics points</li>
            <li><strong>Points → Performance:</strong> Calculate the required performance for a specific points target</li>
          </ul>
          <p>
            Additional features include:
          </p>
          <ul>
            <li>Wind adjustment calculations for relevant events</li>
            <li>Competition level bonus point calculations</li>
            <li>Equivalent performance calculations across different events</li>
            <li>Support for both indoor and outdoor seasons</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Data Sources</h2>
          <p>
            All calculations are based on the official World Athletics Scoring Tables and Competition Regulations. 
            The scoring formulas and competition categories are regularly updated to align with World Athletics 
            standards.
          </p>
        </section>

        <section className="about-section author-section">
          <h2>The Author</h2>
          <p>
            This calculator was developed by Simen Guttormsen, a Norwegian pole vaulter and master's student at Duke University. All questions or suggested improvements can be directed to <a href="mailto:simen.guttormsen@gmail.com">simen.guttormsen@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About; 