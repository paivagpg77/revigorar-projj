import './PageBanner.css'

export default function PageBanner({ eyebrow, title, subtitle, quote, image }) {
  return (
    <section className="pagebanner">
      <div className="container pagebanner__inner">
        <div className="pagebanner__text">
          {eyebrow && <span className="pagebanner__eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="pagebanner__media">
          {image && <img src={image} alt="" />}
          {quote && <p className="pagebanner__quote">{quote}</p>}
        </div>
      </div>
    </section>
  )
}
