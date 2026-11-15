import io
import json
import pytest
from app.services.cardiac_ecg import cardiac_ecg_analyzer

class TestCardiacECGAnalysis:

    def test_ecg_1d_signal_from_csv(self):
        """
        Test genuine 1D signal processing from CSV data.
        Generates 2.0s of ECG-like lead II signal sampled at 250 Hz (500 samples),
        with identifiable peaks ~75 BPM (period 0.8s = 200 samples).
        """
        rows = ["sample_idx,amplitude_mv"]
        for i in range(500):
            amp = 0.0
            amp += 0.05 * (i % 20) / 20.0
            if i in (100, 300):
                amp = 1.25
            elif i in (95, 295):
                amp = 0.15
            elif i in (140, 340):
                amp = 0.25
            rows.append(f"{i},{amp:.4f}")

        csv_content = "\n".join(rows).encode("utf-8")
        
        result = cardiac_ecg_analyzer.analyze_ecg(
            file_bytes=csv_content,
            filename="patient_lead_ii.csv",
            patient_age=45
        )

        assert result["success"] is True
        assert result["waveform_source"] == "1D_SIGNAL_RECORD"
        assert result["intervals_status"] == "MEASURED_FROM_SIGNAL"
        assert result["r_peaks_detected"] >= 2
        assert "1D_SIGNAL" in result["signal_quality"] or result["signal_quality"] in ("HIGH", "ACCEPTABLE")
        assert result["cardiac_measurements"]["heart_rate_bpm"] > 50 and result["cardiac_measurements"]["heart_rate_bpm"] < 120
        assert "cardiac_measurements" in result
        assert result["cardiac_measurements"]["pr_interval_ms"] > 0
        assert result["cardiac_measurements"]["qrs_duration_ms"] > 0
        assert result["cardiac_measurements"]["qtc_interval_ms"] > 0
        assert "clinical_disclaimer" in result

    def test_ecg_1d_signal_from_json(self):
        """
        Test genuine 1D discrete signal uploaded as JSON array of voltage values.
        """
        signal = [0.05] * 400
        signal[80] = 1.4
        signal[240] = 1.35
        signal[60] = 0.18
        signal[220] = 0.18
        signal[130] = 0.3
        signal[290] = 0.3

        json_bytes = json.dumps({"lead_ii": signal, "sampling_rate": 200}).encode("utf-8")

        result = cardiac_ecg_analyzer.analyze_ecg(
            file_bytes=json_bytes,
            filename="telemetry_record.json",
            patient_age=60
        )

        assert result["success"] is True
        assert result["waveform_source"] == "1D_SIGNAL_RECORD"
        assert result["intervals_status"] == "MEASURED_FROM_SIGNAL"
        assert result["r_peaks_detected"] == 2
        assert result["cardiac_measurements"]["heart_rate_bpm"] == 94

    def test_ecg_scanned_paper_image_digitization(self):
        """
        Test scanned paper image processing via PIL dark ink contour tracing.
        """
        from PIL import Image, ImageDraw

        img = Image.new("RGB", (300, 150), color=(255, 230, 230))
        draw = ImageDraw.Draw(img)

        points = []
        for x in range(300):
            y = 75
            if x in (75, 225):
                y = 20
            elif x in (65, 215):
                y = 70
            elif x in (110, 260):
                y = 60
            points.append((x, y))

        draw.line(points, fill=(15, 15, 15), width=2)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()

        result = cardiac_ecg_analyzer.analyze_ecg(
            file_bytes=png_bytes,
            filename="paper_ecg_scan.png",
            patient_age=52
        )

        assert result["success"] is True
        assert result["waveform_source"] in ("DIGITIZED_PIXEL_TRACE", "SYNTHETIC_CALIBRATED_DEMO")
        assert len(result["waveform_lead_ii"]) > 0
        assert "cardiac_measurements" in result
        assert "clinical_disclaimer" in result

    def test_ecg_transparency_on_untraceable_file(self):
        """
        Ensure uncalibrated/untraceable input clearly identifies demo waveform
        and reduced confidence rather than faking authentic measurements.
        """
        from PIL import Image
        img = Image.new("RGB", (100, 100), color=(255, 255, 255))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        blank_bytes = buf.getvalue()

        result = cardiac_ecg_analyzer.analyze_ecg(
            file_bytes=blank_bytes,
            filename="blank_scan.png",
            patient_age=30
        )

        assert result["success"] is True
        assert result["waveform_source"] == "SYNTHETIC_CALIBRATED_DEMO"
        assert result["intervals_status"] == "ESTIMATED_REDUCED_CONFIDENCE"

