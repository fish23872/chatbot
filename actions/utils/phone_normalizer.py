import re

class PhoneNormalizer:
    @staticmethod
    def normalize_samsung(model: str):
        pattern = re.compile(
            r"(samsung\s*)?"
            r"(galaxy\s*)?"
            r"(z\s*)?"
            r"("
            r"s(\d{1,2})" 
            r"|fold\s*(\d?)"
            r"|a(\d{2})"      
            r"|note\s*(\d{2})" 
            r")"
            r"\s*"
            r"(\+|plus|ultra|fe|5g)?"  
            r"$",
            re.IGNORECASE
        )
        
        match = pattern.match(model.strip())
        if not match:
            return None
        
        _, _, z_prefix, _, s_num, fold_num, a_num, note_num, variant = match.groups()
        
        if s_num:
            base = f"S{s_num}"
        elif fold_num:
            base = f"Z Fold{fold_num}" if z_prefix else f"Fold{fold_num}"
        elif a_num:
            base = f"A{a_num}"
        elif note_num:
            base = f"Note {note_num}"
        else:
            return None
        
        variant_str = ""
        if variant:
            variant_lower = variant.lower()
            if variant_lower == "plus":
                variant_str = " +"
            else:
                variant_str = f" {variant.title()}"
        
        return f"Samsung Galaxy {base}{variant_str}".strip()

    @staticmethod
    def normalize_xiaomi(model: str):
        """Normalize Xiaomi/Redmi/Poco"""
        model_lower = model.lower().strip()
        
        mi_match = re.match(r"(?:xiaomi\s+)?mi\s+(\d+)(?:\s+(t|pro|ultra|lite|se))?$", model_lower)
        if mi_match:
            model_num = mi_match.group(1)
            suffix = mi_match.group(2)
            base = f"Xiaomi Mi {model_num}"
            if suffix:
                if suffix == 't':
                    return f"{base} {suffix.upper()}"
                return f"{base} {suffix.title()}"
            return base
        
        redmi_match = re.match(r"(?:xiaomi\s+)?redmi(?:\s+(note\s+)?)(\d+)([a-z]*)(?:\s+(pro|ultra|prime))?$", model_lower)
        if redmi_match:
            note_part = "Note " if redmi_match.group(1) else ""
            model_num = redmi_match.group(2)
            model_letter = redmi_match.group(3).upper()
            suffix = redmi_match.group(4)
            base = f"Xiaomi Redmi {note_part}{model_num}{model_letter}"
            if suffix:
                return f"{base} {suffix.title()}" 
            return base
        
        poco_match = re.match(r"(?:xiaomi\s+)?poco\s+([xmf]\d+)(?:\s+(pro|gt))?$", model_lower)
        if poco_match:
            model_code = poco_match.group(1).upper()
            suffix = poco_match.group(2)
            base = f"Xiaomi Poco {model_code}"
            if suffix:
                return f"{base} {suffix.upper() if suffix == 'gt' else suffix.title()}"
            return base
        
        numbered_match = re.match(r"(?:xiaomi\s+)?"r"(\d{1,2}[t|s]?)"r"(?:\s+(pro|ultra))?$",model_lower)
        if numbered_match:
            model_num = numbered_match.group(1).upper()
            suffix = numbered_match.group(2)
            base = f"Xiaomi {model_num}"
            if suffix:
                return f"{base} {suffix.upper() if suffix == 't' else suffix.title()}"
            return base
        
        return None

    @staticmethod
    def normalize_iphone(model: str):
        """Normalize iPhone model names with support for all variants"""
        model_lower = model.lower().strip()
        
        iphone_match = re.match(
            r"(?:iphone|i\s*phone|)\s*"
            r"(\d{1,2}|[xX][rRsS]?|se)"
            r"(?:\s*"
            r"(pro\s*max|max|pro|plus|mini)"  
            r")?$",
            model_lower
        )
        
        if not iphone_match:
            return None
        
        model_part = iphone_match.group(1).upper()
        variant = iphone_match.group(2)
        
        if model_part == 'XR':
            return 'iPhone XR'
        if model_part == 'XS':
            return 'iPhone XS'
        if model_part == 'SE':
            return 'iPhone SE'

        result = f"iPhone {model_part}"
        
        if variant:
            variant = variant.replace(' ', '').lower()
            if variant == 'promax':
                result += ' Pro Max'
            elif variant == 'pro':
                result += ' Pro'
            elif variant == 'max':
                result += ' Max'
            elif variant == 'plus':
                result += ' Plus'
            elif variant == 'mini':
                result += ' Mini'
        
        return result

    @staticmethod
    def normalize_oneplus(model: str):
        """Normalize OnePlus model names with consistent variant formatting (excluding 5G labels)"""
        model_lower = model.lower().strip()

        oneplus_match = re.match(
            r"(?:oneplus|one\s*plus|op)\s*"
            r"(\d{1,2}|nord\s*\w*)"          
            r"(?:\s*"                        
            r"(pro|t|r|ce|ultra|5g|plus)"   
            r")?"                            
            r"(?:\s*"                      
            r"(pro|t|r|ce|ultra|5g|plus)"    
            r")?$",                          
            model_lower
        )
        
        if not oneplus_match:
            return None
        
        model_part = oneplus_match.group(1).replace(" ", "")
        variant1 = oneplus_match.group(2)
        variant2 = oneplus_match.group(3)
        
        if 'nord' in model_part:
            nord_match = re.match(r"nord\s*(\w*)", model_part)
            if nord_match:
                nord_variant = nord_match.group(1)
                base = "OnePlus Nord"
                if nord_variant:
                    return f"{base} {nord_variant.title()}"
                return base
        
        result = f"OnePlus {model_part}"
        
        variants = []

        if variant1 and variant1 != '5g':
            variants.append(variant1.upper() if variant1 in ['t', 'r'] else variant1.title())
        if variant2 and variant2 != '5g':
            variants.append(variant2.upper() if variant2 in ['t', 'r'] else variant2.title())
        
        if variants:
            if variants[0].lower() in ['t', 'r'] and model_part.isdigit():
                result += variants[0].upper()
            else:
                result += " " + " ".join(variants)
        
        return result

    @classmethod
    def normalize(cls, model: str):
        if not model or not isinstance(model, str):
            return None
            
        return (
            cls.normalize_samsung(model) or
            cls.normalize_xiaomi(model) or
            cls.normalize_iphone(model) or
            cls.normalize_oneplus(model)
        )