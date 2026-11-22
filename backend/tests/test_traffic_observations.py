import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from backend.app.services.cache_service import cache
from backend.app.services.traffic_service import TrafficService


def response(status=200, payload=None, date="Sun, 22 Nov 2026 11:18:46 GMT"):
    return SimpleNamespace(
        status_code=status,
        headers={"Date": date},
        text="",
        json=lambda: payload or {"flowSegmentData": {"currentSpeed": 30, "freeFlowSpeed": 36}},
    )


class TrafficObservationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        cache.clear()
        self.history_patch = patch("backend.app.services.traffic_service.HistoryService.record_traffic_roads")
        self.history_patch.start()
        self.addCleanup(self.history_patch.stop)

    async def asyncTearDown(self):
        cache.clear()

    def mock_client(self, get):
        client = MagicMock()
        client.__aenter__ = AsyncMock(return_value=client)
        client.__aexit__ = AsyncMock(return_value=False)
        client.get = AsyncMock(side_effect=get)
        return client

    @patch("backend.app.services.traffic_service.settings.TOMTOM_API_KEY", "test-key")
    @patch("backend.app.services.traffic_service.httpx.AsyncClient")
    async def test_raw_tomtom_speed_fields_map_to_selected_road(self, client_factory):
        async def get(url, **kwargs):
            if "incidentDetails" in url:
                return response(payload={"incidents": []})
            return response(payload={"flowSegmentData": {
                "currentSpeed": 30, "freeFlowSpeed": 36,
                "coordinates": {"coordinate": [
                    {"longitude": 77.26, "latitude": 28.63},
                    {"longitude": 77.27, "latitude": 28.64},
                ]},
            }})

        client_factory.return_value = self.mock_client(get)
        result = await TrafficService.get_traffic_data(force_refresh=True)

        self.assertEqual(result.status, "LIVE")
        self.assertTrue(all(road.isLive for road in result.roads))
        road = next(road for road in result.roads if road.id == "ROAD-VIKAS-MARG")
        self.assertEqual(road.avgSpeedKmH, 30)
        self.assertEqual(road.freeFlowSpeedKmH, 36)
        self.assertEqual(road.congestionRatio, 30 / 36)
        self.assertEqual(road.sourceTimestamp, "Sun, 22 Nov 2026 11:18:46 GMT")
        self.assertEqual(road.trafficGeometry, [[77.26, 28.63], [77.27, 28.64]])

    @patch("backend.app.services.traffic_service.settings.TOMTOM_API_KEY", "test-key")
    @patch("backend.app.services.traffic_service.httpx.AsyncClient")
    async def test_missing_speed_fields_are_not_replaced_with_corridor_defaults(self, client_factory):
        async def get(url, **kwargs):
            if "incidentDetails" in url:
                return response(payload={"incidents": []})
            return response(payload={"flowSegmentData": {"confidence": 1}})

        client_factory.return_value = self.mock_client(get)
        result = await TrafficService.get_traffic_data(force_refresh=True)

        self.assertEqual(result.status, "API_ERROR")
        self.assertIn("omitted currentSpeed or freeFlowSpeed", result.errorMessage)
        self.assertTrue(result.roads)
        self.assertTrue(all(not road.isLive for road in result.roads))
        self.assertTrue(all("Fallback" in road.source for road in result.roads))

    @patch("backend.app.services.traffic_service.settings.TOMTOM_API_KEY", "test-key")
    @patch("backend.app.services.traffic_service.httpx.AsyncClient")
    async def test_partial_feed_keeps_only_observed_roads(self, client_factory):
        flow_calls = 0

        async def get(url, **kwargs):
            nonlocal flow_calls
            if "incidentDetails" in url:
                return response(payload={"incidents": []})
            flow_calls += 1
            if flow_calls == 1:
                return response(payload={"flowSegmentData": {
                    "currentSpeed": 30, "freeFlowSpeed": 36,
                }})
            return response(payload={"flowSegmentData": {}})

        client_factory.return_value = self.mock_client(get)
        result = await TrafficService.get_traffic_data(force_refresh=True)

        self.assertEqual(result.status, "PARTIAL")
        self.assertEqual(len(result.roads), 1)
        self.assertTrue(result.roads[0].isLive)
        self.assertEqual(result.roads[0].avgSpeedKmH, 30)
        self.assertEqual(result.roads[0].freeFlowSpeedKmH, 36)
        self.assertIn("omitted currentSpeed or freeFlowSpeed", result.errorMessage)

    @patch("backend.app.services.traffic_service.settings.TOMTOM_API_KEY", "test-key")
    @patch("backend.app.services.traffic_service.httpx.AsyncClient")
    async def test_zero_speed_is_kept_as_an_observation_without_invented_travel_time(self, client_factory):
        async def get(url, **kwargs):
            if "incidentDetails" in url:
                return response(payload={"incidents": []})
            return response(payload={"flowSegmentData": {
                "currentSpeed": 0, "freeFlowSpeed": 30,
            }})

        client_factory.return_value = self.mock_client(get)
        result = await TrafficService.get_traffic_data(force_refresh=True)

        self.assertEqual(result.status, "LIVE")
        self.assertEqual(result.roads[0].avgSpeedKmH, 0)
        self.assertEqual(result.roads[0].congestionRatio, 0)
        self.assertIsNone(result.roads[0].travelTimeMin)

    @patch("backend.app.services.traffic_service.settings.TOMTOM_API_KEY", "test-key")
    async def test_cached_response_is_identified_as_cached(self):
        from backend.app.schemas.traffic import TrafficResponseSchema

        cached = TrafficResponseSchema(
            roads=[], incidents=[], totalRoads=0, averageSpeedKmH=0,
            averageCongestionPercent=0, highCongestionRoadsCount=0,
            lastUpdated="Sun, 22 Nov 2026 11:18:46 GMT", source="TomTom Traffic Flow API",
            status="LIVE",
        )
        cache.set("delhi_traffic_data", cached, 120)
        result = await TrafficService.get_traffic_data()
        self.assertEqual(result.status, "CACHED")
        self.assertIsNotNone(result.cacheAgeSeconds)
        self.assertEqual(result.lastUpdated, cached.lastUpdated)


if __name__ == "__main__":
    unittest.main()
