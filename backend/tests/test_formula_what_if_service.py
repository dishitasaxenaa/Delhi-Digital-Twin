import unittest

from backend.app.services.formula_what_if_service import calculate_what_if


class FormulaWhatIfTests(unittest.TestCase):
    def setUp(self):
        self.road = {
            "id": "test-road", "name": "Test Road", "source": "TomTom Traffic Flow API",
            "isLive": True, "avgSpeedKmH": 40.0, "freeFlowSpeedKmH": 60.0, "lengthKm": 10.0,
            # Deliberately implausible proxy to ensure it is never treated as a count.
            "flowVehiclesPerHour": 3600,
        }

    def run_case(self, scenario_type, direction, change_percent=20):
        return calculate_what_if(self.road, scenario_type=scenario_type, direction=direction,
                                  change_percent=change_percent)

    def test_demand_increase_lowers_speed_and_raises_travel_time(self):
        result = self.run_case("traffic_demand", "increase")
        self.assertEqual(result["baseline"]["speed_kmh"], 40)
        self.assertEqual(result["road"]["traffic_source"], "TomTom observation")
        self.assertEqual(result["estimated"]["demand_index"], 120)
        self.assertLess(result["estimated"]["speed_kmh"], result["baseline"]["speed_kmh"])
        self.assertGreater(result["estimated"]["travel_time_minutes"], result["baseline"]["travel_time_minutes"])

    def test_demand_decrease_raises_speed_and_lowers_travel_time(self):
        result = self.run_case("traffic_demand", "decrease")
        self.assertEqual(result["estimated"]["demand_index"], 80)
        self.assertGreater(result["estimated"]["speed_kmh"], result["baseline"]["speed_kmh"])
        self.assertLess(result["estimated"]["travel_time_minutes"], result["baseline"]["travel_time_minutes"])

    def test_signal_green_increase_raises_capacity_and_speed(self):
        result = self.run_case("signal_green_time", "increase")
        self.assertEqual(result["estimated"]["capacity_index"], 120)
        self.assertGreater(result["estimated"]["speed_kmh"], result["baseline"]["speed_kmh"])
        self.assertEqual(result["percent_changes"]["capacity_index"], 20)

    def test_signal_green_decrease_lowers_capacity_and_speed(self):
        result = self.run_case("signal_green_time", "decrease")
        self.assertEqual(result["estimated"]["capacity_index"], 80)
        self.assertLess(result["estimated"]["speed_kmh"], result["baseline"]["speed_kmh"])

    def test_relative_indices_are_not_presented_as_vehicle_counts(self):
        result = self.run_case("traffic_demand", "increase")
        self.assertNotIn("demand_veh_per_hour", result["baseline"])
        assumption = next(item for item in result["assumptions"] if item["name"] == "Relative demand and capacity indices")
        self.assertIn("not vehicles/hour", assumption["source"])

    def test_requires_live_tomtom_observations_instead_of_static_defaults(self):
        fallback = {**self.road, "isLive": False, "source": "Delhi Arterial Network"}
        with self.assertRaisesRegex(ValueError, "live TomTom observation is required"):
            calculate_what_if(fallback, scenario_type="traffic_demand", direction="increase", change_percent=10)

    def test_rejects_unsupported_scenarios_and_invalid_green_change(self):
        with self.assertRaises(ValueError):
            calculate_what_if(self.road, scenario_type="unsupported", direction="increase", change_percent=10)
        with self.assertRaisesRegex(ValueError, "Green time cannot be reduced to zero"):
            self.run_case("signal_green_time", "decrease", 100)


if __name__ == "__main__":
    unittest.main()
