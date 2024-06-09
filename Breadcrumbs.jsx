import { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import {
  setActiveBrand,
  getBrandDetails,
  getBrandUser
} from '../../actions/brand';
import { getAllBrands } from '../../actions/user';
import { saveBrand } from '../../utils/global.services';
import { ModalConfirmation } from '../../UI/ModalConfirmation/ModalConfirmation';
import classes from './Breadcrumbs.module.css';
import { BrandSelect } from '../../UI/BrandSelect/BrandSelect';

const Breadcrumbs = ({
  user: { brands, brands_loading },
  auth: { user },
  brand: { active, isFirst },
  sellers_comparison: { sellersInComparsion },
  setActiveBrand,
  getAllBrands,
  getBrandDetails,
  getBrandUser,
  breadComponent,
  headerText,
  multiple,
  isFixed
}) => {
  const storageBrand = useMemo(() => localStorage.getItem('brand'), []);
  const initialBrand = useMemo(() => {
    if (active) {
      return multiple ? [active] : active;
    }
    let brandData = { name: '' };
    if (user.brands) {
      const all = user.brands.find((b) => b.name === 'All');
      if (user.brands.length) {
        const brandDetails = user.brands.find((b) => b.name === storageBrand);
        if (storageBrand && brandDetails) {
          brandData = brandDetails;
        } else {
          brandData = !all ? user.brands[0] : brands ? brands[0] : '';
        }
      }
    } else if (brands) {
      const brandDetails = brands.find((b) => b.name === storageBrand);
      if (storageBrand && brandDetails) {
        brandData = brandDetails;
      } else if (brands[0]) {
        brandData = brands[0];
      }
    }
    if (multiple) {
      return brandData ? [brandData] : [];
    }
    return brandData;
  }, [active, storageBrand, brands, user.brands, multiple]);

  const menuList = useMemo(() => {
    if (user.brands) {
      const all = user.brands.find((b) => b.name === 'All');
      return !all ? user.brands : brands ? brands : [];
    }
    return brands ? brands : [];
  }, [user.brands, brands]);
  const [brand, setBrand] = useState(initialBrand);
  const [brandToApprove, setBrandToApprove] = useState(null);
  const [isOpen, setOpen] = useState(false);

  const onChange = (value) => {
    if (sellersInComparsion?.length) {
      setBrandToApprove(value);
      setOpen(true);
    } else {
      if (value) setActiveBrand(value);
      setBrand(value);
      saveBrand(multiple ? value[0]?.name : value?.name);
    }
  };

  const onApprove = () => {
    if (brandToApprove) {
      setActiveBrand(brandToApprove);
      setBrand(brandToApprove);
      saveBrand(multiple ? brandToApprove[0]?.name : brandToApprove?.name);
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!brands && user.brands) {
      if (user.brands.find((b) => b.name === 'All')) {
        getAllBrands();
      }
    }
  }, [brands, getAllBrands, user.brands]);

  useEffect(() => {
    const listBrand = storageBrand
      ? menuList.find((l) => l.name === storageBrand)
      : null;
    if (!active && menuList.length) {
      if (multiple) {
        setActiveBrand(listBrand ? [listBrand] : [menuList[0]]);
        if (!brand?.name) {
          setBrand(listBrand ? [listBrand] : [menuList[0]]);
        }
      } else {
        setActiveBrand(listBrand ? listBrand : menuList[0]);
        if (!brand?.name) {
          setBrand(listBrand ? listBrand : menuList[0]);
        }
      }
    }
  }, [brand, menuList, active, setActiveBrand, storageBrand, multiple]);

  //Get brand details if brand changed
  useEffect(() => {
    if (active && isFirst) {
      getBrandDetails(active.name);
    }
  }, [active, getBrandDetails, isFirst, getBrandUser]);

  return (
    <div className={classes.container}>
      <div className={classes.breadBox}>
        <div
          className={`${classes.brandSelect} ${
            isFixed ? classes.brandSelectFixed : ''
          }`}
        >
          <span className={classes.header}>Brand:</span>
          <BrandSelect
            defaultValue={storageBrand}
            options={menuList}
            labelKey="name"
            valueKey="name"
            value={brand}
            onChange={onChange}
            multiple={multiple}
            isLoading={brands_loading}
          />
        </div>
        {headerText && (
          <div
            className={`${classes.brandSelect} ${
              isFixed ? classes.breadHeaderFixed : ''
            }`}
          >
            <div className={classes.divider} />
            <h1>{headerText}</h1>
          </div>
        )}
      </div>
      {breadComponent && <div>{breadComponent}</div>}
      <ModalConfirmation
        isOpen={isOpen}
        setOpen={setOpen}
        onApprove={onApprove}
        message="Changing  brands will remove all sellers. Are you sure you want to change the brand?"
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  brand: state.brand,
  user: state.user,
  sellers_comparison: state.sellers_comparison
});

export default connect(mapStateToProps, {
  setActiveBrand,
  getAllBrands,
  getBrandDetails,
  getBrandUser
})(Breadcrumbs);
