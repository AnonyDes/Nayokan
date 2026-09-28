// The kinds of mentor the Startup Centre works with. Shown in place of the
// mentor directory until individual mentors have approved their profiles:
// it describes the roles, never invents the people.
export const MENTOR_KINDS = [
  { initials: "R", title: "Researchers", desc: "Turning academic work into products, and protecting the IP along the way.", tag: "Research · IP" },
  { initials: "F", title: "Founders", desc: "People who have built ventures in African markets and know the early years.", tag: "Commercialization" },
  { initials: "O", title: "Operators", desc: "Product, operations and go-to-market experience from working businesses.", tag: "Product · Go-to-market" },
  { initials: "I", title: "Investors", desc: "Readiness, structuring and what capital expects at each stage.", tag: "Capital · Structuring" },
];

export function MentorKinds() {
  return (
    <div className="mentors-grid">
      {MENTOR_KINDS.map((k) => (
        <article className="mentor-card mentor-card--kind" key={k.title}>
          <div className="mentor-kind-mark" aria-hidden="true">
            {k.initials}
          </div>
          <div className="mentor-name">{k.title}</div>
          <div className="mentor-role">{k.desc}</div>
          <div className="mentor-tag">{k.tag}</div>
        </article>
      ))}
    </div>
  );
}
