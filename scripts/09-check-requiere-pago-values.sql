-- Check unique values in requiere_pago field to understand the data
SELECT DISTINCT requiere_pago, COUNT(*) as count
FROM tramites
WHERE is_active = true
GROUP BY requiere_pago
ORDER BY count DESC;
