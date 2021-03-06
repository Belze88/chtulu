<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 22/03/18
 * Time: 22:59
 */

namespace App\DTO;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class ResourceVersionDTO extends EntityMutableDTO
{
    /** @var string */
    protected $name;
    /** @var string */
    protected $type;
    /** @var integer */
    protected $number;
    /** @var UploadedFile */
    protected $file;
    /** @var array */
    protected $urls;

    /**
     * ResourceVersionDTO constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->urls = [];
    }

    /**
     * @return string|null
     * @Groups({"minimal"})
     * @Assert\NotBlank()
     * @Assert\NotNull()
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     * @return self
     */
    public function setName(?string $name): ResourceVersionDTO
    {
        $this->name = $name;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('name');
        return $this;
    }

    /**
     * @return string|null
     * @Groups({"minimal"})
     */
    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @param string $type
     * @return ResourceVersionDTO
     */
    public function setType(?string $type): ResourceVersionDTO
    {
        $this->type = $type;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('type');
        return $this;
    }

    /**
     * @return int
     * @Groups({"minimal"})
     */
    public function getNumber(): ?int
    {
        return $this->number;
    }

    /**
     * @param int $number
     * @return ResourceVersionDTO
     */
    public function setNumber(?int $number): ResourceVersionDTO
    {
        $this->number = $number;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('number');
        return $this;
    }

    /**
     * @return UploadedFile|null
     * @Groups({"file"})
     * @Assert\NotBlank()
     * @Assert\NotNull()
     */
    public function getFile(): ?UploadedFile
    {
        return $this->file;
    }

    /**
     * @param UploadedFile|null $file
     * @return ResourceVersionDTO
     */
    public function setFile(?UploadedFile $file): ResourceVersionDTO
    {
        $this->file = $file;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('file');
        return $this;
    }

    /**
     * @return string
     * @Groups({"urlDetailThumbnail"})
     */
    public function getUrlDetailThumbnail(): ?string
    {
        if(!array_key_exists('detailThumbnail',$this->urls)) return null;
        return $this->urls['detailThumbnail'];
    }

    /**
     * @return string
     * @Groups({"urlMini"})
     */
    public function getUrlMini(): ?string
    {
        if(!array_key_exists('mini',$this->urls)) return null;
        return $this->urls['mini'];
    }

    /**
     * @return string
     * @Groups({"urlW160"})
     */
    public function getUrlW160(): ?string
    {
        if(!array_key_exists('w160',$this->urls)) return null;
        return $this->urls['w160'];
    }

    /**
     * @return string
     * @Groups({"urlW500"})
     */
    public function getUrlW500(): ?string
    {
        if(!array_key_exists('w500',$this->urls)) return null;
        return $this->urls['w500'];
    }

    /**
     * @return string
     * @Groups({"urlW800"})
     */
    public function getUrlW800(): ?string
    {
        if(!array_key_exists('w800',$this->urls)) return null;
        return $this->urls['w800'];
    }

    /**
     * @return string
     * @Groups({"urlW1500"})
     */
    public function getUrlW1500(): ?string
    {
        if(!array_key_exists('w1500',$this->urls)) return null;
        return $this->urls['w1500'];
    }

    /**
     * @param array $urls
     * @return ResourceVersionDTO
     */
    public function addUrls(array $urls): ResourceVersionDTO
    {
        $this->urls = array_merge($this->urls,$urls);
        return $this;
    }



}