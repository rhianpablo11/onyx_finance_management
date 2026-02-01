from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.charge_type import Charge_type


def get_charge_type_id(charge_type_in:str, charges_types_existing, db: Session):
    print('charge types existing')
    print(charges_types_existing)

    print('conferindo segundo if')
    print((charge_type_in not in charges_types_existing))

    if(len(charges_types_existing) == 0):
        new_charge = Charge_type(
            name=charge_type_in
        )
        db.add(new_charge)
        db.commit()
        db.refresh(new_charge)
        print(new_charge)
    elif(charge_type_in not in charges_types_existing):
        new_charge = Charge_type(
            name=charge_type_in
        )
        db.add(new_charge)
        db.commit()
        db.refresh(new_charge)
        print(new_charge)
    
    
    charge_type_id = db.query(Charge_type.id).filter(Charge_type.name == charge_type_in).first()[0]

    return charge_type_id


def get_charge_type_by_id(id: int, db: Session):
    stmt = select(Charge_type.name).where(Charge_type.id == id)
    charge_name = db.execute(stmt).scalars().first()
    #colocar verificação caso n tenha nenhuma categoria
    return charge_name
