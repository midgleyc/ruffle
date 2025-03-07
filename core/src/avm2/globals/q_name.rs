//! `QName` impl

use crate::avm2::activation::Activation;
use crate::avm2::object::{Object, TObject};
use crate::avm2::value::Value;
use crate::avm2::Error;
use crate::avm2::Namespace;

pub use crate::avm2::object::q_name_allocator;

/// Implements `QName`'s `init` method, which is called from the constructor.
pub fn init<'gc>(
    activation: &mut Activation<'_, 'gc>,
    this: Option<Object<'gc>>,
    args: &[Value<'gc>],
) -> Result<Value<'gc>, Error<'gc>> {
    let this = this.unwrap().as_qname_object().unwrap();
    let namespace = if !matches!(args[1], Value::Undefined) {
        let ns_arg = args.get(0).cloned().unwrap();
        let local_arg = args.get(1).cloned().unwrap_or(Value::Undefined);

        let namespace = match ns_arg {
            Value::Object(o) if o.as_namespace().is_some() => o.as_namespace().as_deref().copied(),
            Value::Undefined | Value::Null => None,
            v => Some(Namespace::package(
                v.coerce_to_string(activation)?,
                &mut activation.borrow_gc(),
            )),
        };
        if let Value::Object(Object::QNameObject(qname)) = local_arg {
            this.set_local_name(activation.context.gc_context, qname.local_name());
        } else {
            this.set_local_name(
                activation.context.gc_context,
                local_arg.coerce_to_string(activation)?,
            );
        }
        namespace
    } else {
        let qname_arg = args.get(0).cloned().unwrap_or(Value::Undefined);
        if let Value::Object(Object::QNameObject(qname_obj)) = qname_arg {
            this.init_name(activation.context.gc_context, qname_obj.name().clone());
            return Ok(Value::Undefined);
        }
        let local = qname_arg.coerce_to_string(activation)?;
        if &*local != b"*" {
            this.set_local_name(activation.context.gc_context, local);
            Some(activation.avm2().public_namespace)
        } else {
            None
        }
    };

    if let Some(namespace) = namespace {
        this.set_namespace(activation.context.gc_context, namespace)
    }

    Ok(Value::Undefined)
}

/// Implements `QName.localName`'s getter
pub fn get_local_name<'gc>(
    _activation: &mut Activation<'_, 'gc>,
    this: Option<Object<'gc>>,
    _args: &[Value<'gc>],
) -> Result<Value<'gc>, Error<'gc>> {
    if let Some(this) = this.and_then(|t| t.as_qname_object()) {
        return Ok(this.local_name().into());
    }

    Ok(Value::Undefined)
}

/// Implements `QName.uri`'s getter
pub fn get_uri<'gc>(
    _activation: &mut Activation<'_, 'gc>,
    this: Option<Object<'gc>>,
    _args: &[Value<'gc>],
) -> Result<Value<'gc>, Error<'gc>> {
    if let Some(this) = this.and_then(|t| t.as_qname_object()) {
        return Ok(this.uri().map(Value::from).unwrap_or(Value::Null));
    }

    Ok(Value::Undefined)
}

/// Implements `QName.AS3::toString` and `QName.prototype.toString`
pub fn to_string<'gc>(
    activation: &mut Activation<'_, 'gc>,
    this: Option<Object<'gc>>,
    _args: &[Value<'gc>],
) -> Result<Value<'gc>, Error<'gc>> {
    if let Some(this) = this.and_then(|t| t.as_qname_object()) {
        return Ok(this.name().as_uri(activation.context.gc_context).into());
    }

    Ok(Value::Undefined)
}
