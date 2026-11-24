import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CATEGORY_PALETTE,
  NEUTRAL_COLOR,
  getCategoryColor,
} from './categoryColor.js'

// Pruebas para la asignación de color de fondo por categoría (RF-16).
describe('categoryColor', () => {
  it('asigna el color de la paleta a las categorías conocidas de la estética botica', () => {
    assert.equal(getCategoryColor('Rostro'), CATEGORY_PALETTE.rostro)
    assert.equal(getCategoryColor('Cuerpo'), CATEGORY_PALETTE.cuerpo)
    assert.equal(getCategoryColor('Cabello'), CATEGORY_PALETTE.cabello)
  })

  it('resuelve la categoría sin distinguir mayúsculas, acentos ni espacios laterales', () => {
    assert.equal(getCategoryColor('ROSTRO'), getCategoryColor('Rostro'))
    assert.equal(getCategoryColor('  rostro '), getCategoryColor('Rostro'))
    assert.equal(getCategoryColor('Cúerpo'), getCategoryColor('Cuerpo'))
    assert.equal(getCategoryColor('CABELLO'), getCategoryColor('Cabello'))
  })

  it('devuelve el color neutro para categorías sin color asignado como Aromaterapia', () => {
    assert.equal(getCategoryColor('Aromaterapia'), NEUTRAL_COLOR)
    assert.equal(getCategoryColor('Maquillaje'), NEUTRAL_COLOR)
  })

  it('devuelve el color neutro ante valores vacíos, nulos o indefinidos', () => {
    assert.equal(getCategoryColor(''), NEUTRAL_COLOR)
    assert.equal(getCategoryColor('   '), NEUTRAL_COLOR)
    assert.equal(getCategoryColor(null), NEUTRAL_COLOR)
    assert.equal(getCategoryColor(undefined), NEUTRAL_COLOR)
  })
})
