import { createDatastore } from '>/helpers'
import { pickupSeriesMock } from '>/mockdata'
import { makeStore, makePickupSeries } from '>/enrichedFactories'

describe('pickupSeries module', () => {
  beforeEach(() => jest.resetModules())

  describe('with vuex', () => {
    let datastore
    let series1 = pickupSeriesMock[0]

    beforeEach(() => {
      datastore = createDatastore({
        pickupSeries: require('./pickupSeries').default,
        pickups: { getters: { all: () => [] } },
        stores: { getters: { get: () => () => null } },
      })
    })

    beforeEach(() => {
      datastore.commit('pickupSeries/set', [series1])
    })

    it('can update series', () => {
      const changed = { ...series1, description: 'new description' }
      datastore.commit('pickupSeries/update', [changed])
      expect(datastore.getters['pickupSeries/get'](changed.id).description).toEqual(changed.description)
    })

    it('can delete series', () => {
      datastore.commit('pickupSeries/delete', series1.id)
      expect(datastore.getters['pickupSeries/get'](series1.id)).toBeUndefined()
    })
  })

  it('filters by active store', () => {
    const activeStore = makeStore({ isActiveStore: true })
    const activeSeries = makePickupSeries({ store: activeStore })
    const inactiveStore = makeStore({ isActiveStore: false })
    const inactiveSeries = makePickupSeries({ store: inactiveStore })
    const { getters } = require('./pickupSeries').default
    const otherGetters = {
      all: [activeSeries, inactiveSeries],
    }

    const result = getters.byActiveStore(null, otherGetters)
    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(activeSeries.id)
  })
})
