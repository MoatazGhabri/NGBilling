UPDATE users 
SET password = '$2b$12$rAv05.T96ijdnmHDCj.HOuWY480krVwYDvFkMmM8UB5Nctog196iG' 
WHERE email = 'admin@ngbilling.com';

SELECT ROW_COUNT() as rows_updated; 