<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 24/03/18
 * Time: 00:46
 */

namespace App\Mediator;

use App\DTO\ResourceVersionDTO;
use App\Entity\ResourceFile;
use App\Entity\ResourceVersion;
use App\Factory\DTOFactory;
use App\Factory\EntityFactory;
use App\Manager\File\FileRouter;
use App\Observer\DBActionObserver;
use App\Util\Command\EntityMapperCommand;
use App\Util\Command\LinkCommand;
use Psr\Container\ContainerInterface;


class ResourceVersionDTOMediator extends DTOMediator
{
    const DTO_CLASS_NAME = ResourceVersionDTO::class;
    const ENTITY_CLASS_NAME = ResourceVersion::class;

    /** @var FileRouter */
    private $fileRouter;
    /**
     * ResourceVersionDTOMediator constructor.
     * @param ContainerInterface $locator
     * @param DBActionObserver $dbActionObserver
     */
    public function __construct(ContainerInterface $locator, DBActionObserver $dbActionObserver)
    {
        parent::__construct($locator,$dbActionObserver);
        $this->dtoClassName = ResourceVersionDTO::class;
        $this->entityClassName = ResourceVersion::class;
        $this->groups = ['minimal','file','urlDetailThumbnail','urlMini'];
    }

    /**
     * @return array
     */
    public static function getSubscribedServices()
    {
        return [
            EntityFactory::class,
            DTOFactory::class,
            FileRouter::class
        ];
    }

    protected function mapDTOMinimalGroup()
    {
        /** @var ResourceVersion $version */
        $version = $this->entity;
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        $dto
            ->setId($version->getId())
            ->setNumber($version->getNumber())
            ->setType(($version->getFile())?$version->getFile()->getType():null);
            //->addMappedGroup('minimal');
    }

    protected function mapDTOFileGroup(){}

    protected function mapDTOUrlDetailThumbnailGroup()
    {
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        /** @var ResourceVersion $version*/
        $version = $this->entity;
        if($version->getId() !== null && $version->getId()>0){
            $fileRouter = $this->locator->get(fileRouter::class);
            $dto->addUrls(
                ["detailThumbnail"=>$fileRouter->getVersionRoute($version,"detail_thumbnail")]);
        }

    }

    protected function mapDTOUrlMiniGroup()
    {
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        /** @var ResourceVersion $version*/
        $version = $this->entity;

        if($version->getId() !== null && $version->getId()>0){
            $fileRouter = $this->locator->get(fileRouter::class);
            $dto->addUrls(
                ["mini"=>$fileRouter->getVersionRoute($version,"mini")]);
        }
    }

    protected function mediateFile()
    {
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        if($dto->getFile() === null){return true;}

        /** @var ResourceVersion $version*/
        $version = $this->entity;

        if($version->getFile() === null){
            $resourceFile = $this->locator->get(EntityFactory::class)->create(ResourceFile::class);
            $command = new EntityMapperCommand(
                EntityMapperCommand::ACTION_ADD,
                ResourceFile::class,
                $dto->getId(),
                $resourceFile
            );
            $this->dbActionObserver->registerAction($command);

            $command = new LinkCommand(
                EntityMapperCommand::ACTION_LINK,
                $this->getEntityClassName(),
                $dto->getId(),
                $version
            );
            $command->defineLink(
                ResourceFile::class,
                $dto->getId(),
                'setFile',
                false)
            ->setEntityToLink($resourceFile);
            $this->dbActionObserver->registerAction($command);
        }
        else{
            $resourceFile = $version->getFile();
        }

        try{
            $resourceFile->setType($dto->getFile()->guessExtension())
                ->setMimeType($dto->getFile()->getMimeType())
                ->setSize($dto->getFile()->getSize());
        }
        catch(\Exception $e){
            // TODO handle this exception ?
            $machin ='lol';
        }

        return true;
    }
}