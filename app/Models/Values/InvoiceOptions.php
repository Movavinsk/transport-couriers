<?php namespace Sdcn\Models\Values;

class InvoiceOptions extends AbstractValueObject implements \JsonSerializable
{

    /**
     * @var boolean
     */
    protected $including_vat;

    /**
     * @var InvoiceRecipient
     */
    protected $recipient;

    /**
     * @var string
     */
    protected $footer_text;

    /**
     * @var string
     */
    protected $logo;

    public function __construct(InvoiceRecipient $recipient, $footer_text, $including_vat, $logo)
    {
        $this->including_vat = $including_vat;
        $this->recipient = $recipient;
        $this->footer_text = $footer_text;
        $this->logo = $logo;
    }

    /**
     * @return boolean
     */
    public function isIncludingVat()
    {
        return $this->including_vat;
    }

    /**
     * @return InvoiceRecipient
     */
    public function getRecipient()
    {
        return $this->recipient;
    }

    /**
     * @return string
     */
    public function getFooterText()
    {
        return $this->footer_text;
    }

    /**
     * @return string
     */
    public function getLogo()
    {
        return $this->logo;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     *
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *       which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return [
            'recipient' => $this->recipient,
            'footer_text' => $this->footer_text,
            'invoice_logo' => $this->logo,
            'including_vat' => $this->including_vat,
        ];
    }
}