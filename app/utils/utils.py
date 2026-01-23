from datetime import date
import calendar

# calculate dates
def get_month_range(month: int, year: int):
    first_day = date(year, month, 1)
    # monthrange retorna (dia_semana, ultimo_dia), pegamos o indice 1
    last_day_num = calendar.monthrange(year, month)[1] 
    last_day = date(year, month, last_day_num)
    return first_day, last_day