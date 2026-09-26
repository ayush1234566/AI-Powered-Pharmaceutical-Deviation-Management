export const SAMPLE_REPORTS = [
  {
    id: 'sample-1',
    title: 'Reactor Temperature Excursion (Metformin API)',
    badge: 'API Synthesis',
    text: `DEVIATION REPORT - API Manufacturing Unit

Report Date: September 20, 2026
Deviation ID: PENDING ASSIGNMENT
Reported By: Rajesh Kumar, Production Supervisor

SITE: API Manufacturing Unit - Building C, Reactor Section
PRODUCT: Metformin Hydrochloride API (Intermediate Stage)
BATCH NUMBER: MET-2026-0847
BATCH SIZE: 500 kg

EVENT DESCRIPTION:
During the synthesis stage of Metformin Hydrochloride API production (Step 3 - Condensation Reaction), the reactor temperature exceeded the approved process parameter range. The validated range for the condensation reaction is 78°C ± 2°C (76°C - 80°C). At approximately 14:35 hrs on September 19, 2026, the reactor temperature was recorded at 84.2°C, which is 4.2°C above the upper validated limit.

The temperature excursion lasted approximately 12 minutes before the operator noticed the deviation and manually adjusted the cooling water flow. The temperature was brought back within range by 14:47 hrs.

ROOT CAUSE (PRELIMINARY):
Initial investigation indicates that the cooling water supply valve (CW-RC-007) partially closed due to a pneumatic actuator malfunction. The automated temperature control loop failed to compensate because the PLC alarm setpoint was configured at 85°C instead of the correct 81°C.

IMMEDIATE ACTIONS TAKEN:
1. Reactor temperature manually controlled and brought within range.
2. Cooling water valve CW-RC-007 inspected and manually set to full open position.
3. Batch MET-2026-0847 quarantined pending quality assessment.
4. In-process samples collected at the point of excursion for additional testing.
5. Maintenance team notified for pneumatic actuator inspection.

IMPACT ASSESSMENT (INITIAL):
- The temperature excursion may have caused degradation of the intermediate product.
- Impurity profile may be affected (potential increase in Impurity-C above specification limit of NMT 0.15%).
- No immediate safety concern to personnel.
- The batch is currently quarantined and cannot be released until full investigation is complete.
- Two subsequent batches (MET-2026-0848, MET-2026-0849) scheduled on the same reactor line are on hold pending equipment qualification.

REGULATORY CONSIDERATIONS:
This deviation may need to be reported in the next Annual Product Review (APR). If impurity levels exceed specification, the batch will be rejected, and an OOS investigation will be initiated per SOP-QC-042.`
  },
  {
    id: 'sample-2',
    title: 'Water Loop Microbial Excursion (Formulation Plant B)',
    badge: 'Utility / QC',
    text: `Subject: URGENT - Contamination Found in Water System - Plant B

From: Dr. Anita Sharma, QC Manager
To: QA Department, Plant Engineering
Date: September 22, 2026

Dear Team,

During routine environmental monitoring of the Purified Water system at our Formulation Plant B (Water Loop WL-03), we detected microbial counts exceeding the alert limit.

Details:
- Sampling Point: SP-WL03-07 (Point of Use - Granulation Area)  
- Date of Sampling: September 21, 2026
- Product affected: Amlodipine Besylate Tablets 5mg (Batch ABT-2026-1532)
- Water was used in granulation step on Sept 21 morning shift

Test Results:
- Total Aerobic Microbial Count (TAMC): 180 CFU/mL (Alert Limit: 100 CFU/mL, Action Limit: 500 CFU/mL)
- Endotoxin: Within limits (< 0.25 EU/mL)
- TOC: Within limits (< 500 ppb)
- Conductivity: Within limits

The count exceeds the alert limit but is within the action limit. However, as this water was already used in Batch ABT-2026-1532, we need to assess the impact on the batch.

Immediate actions:
1. Re-sampling of SP-WL03-07 and adjacent points completed
2. Batch ABT-2026-1532 placed on hold
3. Sanitization of WL-03 loop initiated (hot water sanitization at 80°C for 2 hours)
4. Root cause investigation to be initiated

Please treat this as a deviation and initiate the formal documentation process.

Regards,
Dr. Anita Sharma`
  }
];
