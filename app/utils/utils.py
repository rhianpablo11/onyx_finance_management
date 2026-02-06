from datetime import date, timedelta
import calendar

# calculate dates
def get_month_range(month: int, year: int):
    first_day = date(year, month, 1)
    # monthrange retorna (dia_semana, ultimo_dia), pegamos o indice 1
    last_day_num = calendar.monthrange(year, month)[1] 
    last_day = date(year, month, last_day_num)
    return first_day, last_day


def get_previous_month_data():
    today = date.today()
    
   
    first_day_this_month = today.replace(day=1)
    
    last_day_prev_month = first_day_this_month - timedelta(days=1)
    
    prev_month = last_day_prev_month.month
    prev_year = last_day_prev_month.year
    
    return prev_month, prev_year