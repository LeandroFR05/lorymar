const values = [
  { title: 'Ingredientes naturales', text: 'Aceites, mantecas y extractos vegetales de cultivo ecológico.' },
  { title: 'Cruelty free', text: 'Jamás testamos en animales. Nuestras fórmulas son veganas.' },
  { title: 'Envases sostenibles', text: 'Vidrio, aluminio y cartón reciclado. Mínimo plástico.' },
  { title: 'Hecho a mano', text: 'Pequeños lotes elaborados artesanalmente para máxima frescura.' },
]

export default function Values() {
  return (
    <section className="values">
      <div className="container values__grid">
        {values.map((v) => (
          <article key={v.title} className="value">
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
