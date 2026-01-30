import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMocker = createFetchMock(vi)

fetchMocker.enableMocks()
