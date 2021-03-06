import createNode from '../src/createNode'
import YAML from '../src/index'
import Map from '../src/schema/Map'
import Pair from '../src/schema/Pair'
import Scalar from '../src/schema/Scalar'
import Seq from '../src/schema/Seq'

describe('scalars', () => {
  describe('createNode(value, false)', () => {
    test('boolean', () => {
      const s = createNode(false, false)
      expect(s).toBe(false)
    })
    test('null', () => {
      const s = createNode(null, false)
      expect(s).toBeInstanceOf(Scalar)
      expect(s.value).toBe(null)
    })
    test('undefined', () => {
      const s = createNode(undefined, false)
      expect(s).toBeInstanceOf(Scalar)
      expect(s.value).toBe(null)
    })
    test('number', () => {
      const s = createNode(3, false)
      expect(s).toBe(3)
    })
    test('string', () => {
      const s = createNode('test', false)
      expect(s).toBe('test')
    })
  })
})

describe('createNode(value, true)', () => {
  test('boolean', () => {
    const s = createNode(false, true)
    expect(s).toBeInstanceOf(Scalar)
    expect(s.value).toBe(false)
  })
  test('null', () => {
    const s = createNode(null, true)
    expect(s).toBeInstanceOf(Scalar)
    expect(s.value).toBe(null)
  })
  test('undefined', () => {
    const s = createNode(undefined, true)
    expect(s).toBeInstanceOf(Scalar)
    expect(s.value).toBe(null)
  })
  test('number', () => {
    const s = createNode(3, true)
    expect(s).toBeInstanceOf(Scalar)
    expect(s.value).toBe(3)
  })
  test('string', () => {
    const s = createNode('test', true)
    expect(s).toBeInstanceOf(Scalar)
    expect(s.value).toBe('test')
  })
})

describe('arrays', () => {
  test('createNode([])', () => {
    const s = createNode([])
    expect(s).toBeInstanceOf(Seq)
    expect(s.items).toHaveLength(0)
  })
  test('createNode([true], false)', () => {
    const s = createNode([true], false)
    expect(s).toBeInstanceOf(Seq)
    expect(s.items).toMatchObject([true])
  })
  describe('[3, ["four", 5]]', () => {
    const array = [3, ['four', 5]]
    test('createNode(value, false)', () => {
      const s = createNode(array, false)
      expect(s).toBeInstanceOf(Seq)
      expect(s.items).toHaveLength(2)
      expect(s.items[0]).toBe(3)
      expect(s.items[1]).toBeInstanceOf(Seq)
      expect(s.items[1].items).toMatchObject(['four', 5])
    })
    test('createNode(value, true)', () => {
      const s = createNode(array, true)
      expect(s).toBeInstanceOf(Seq)
      expect(s.items).toHaveLength(2)
      expect(s.items[0].value).toBe(3)
      expect(s.items[1]).toBeInstanceOf(Seq)
      expect(s.items[1].items).toHaveLength(2)
      expect(s.items[1].items[0].value).toBe('four')
      expect(s.items[1].items[1].value).toBe(5)
    })
    test('set doc contents', () => {
      const res = '- 3\n- - four\n  - 5\n'
      const doc = new YAML.Document()
      doc.contents = array
      expect(String(doc)).toBe(res)
      doc.contents = createNode(array, false)
      expect(String(doc)).toBe(res)
      doc.contents = createNode(array, true)
      expect(String(doc)).toBe(res)
    })
  })
})

describe('objects', () => {
  test('createNode({})', () => {
    const s = createNode({})
    expect(s).toBeInstanceOf(Map)
    expect(s.items).toHaveLength(0)
  })
  test('createNode({ x: true }, false)', () => {
    const s = createNode({ x: true }, false)
    expect(s).toBeInstanceOf(Map)
    expect(s.items).toHaveLength(1)
    expect(s.items[0]).toBeInstanceOf(Pair)
    expect(s.items[0]).toMatchObject({ key: 'x', value: true })
  })
  describe('{ x: 3, y: [4], z: { w: "five", v: 6 } }', () => {
    const object = { x: 3, y: [4], z: { w: 'five', v: 6 } }
    test('createNode(value, false)', () => {
      const s = createNode(object, false)
      expect(s).toBeInstanceOf(Map)
      expect(s.items).toHaveLength(3)
      expect(s.items).toMatchObject([
        { key: 'x', value: 3 },
        { key: 'y', value: { items: [4] } },
        {
          key: 'z',
          value: {
            items: [{ key: 'w', value: 'five' }, { key: 'v', value: 6 }]
          }
        }
      ])
    })
    test('createNode(value, true)', () => {
      const s = createNode(object, true)
      expect(s).toBeInstanceOf(Map)
      expect(s.items).toHaveLength(3)
      expect(s.items).toMatchObject([
        { key: { value: 'x' }, value: { value: 3 } },
        { key: { value: 'y' }, value: { items: [{ value: 4 }] } },
        {
          key: { value: 'z' },
          value: {
            items: [
              { key: { value: 'w' }, value: { value: 'five' } },
              { key: { value: 'v' }, value: { value: 6 } }
            ]
          }
        }
      ])
    })
    test('set doc contents', () => {
      const res = `x: 3
y:
  - 4
z:
  w: five
  v: 6\n`
      const doc = new YAML.Document()
      doc.contents = object
      expect(String(doc)).toBe(res)
      doc.contents = createNode(object, false)
      expect(String(doc)).toBe(res)
      doc.contents = createNode(object, true)
      expect(String(doc)).toBe(res)
    })
  })
})
