#!/bin/sh
# Program Name: housekeep.sh
# Description: Housekeep files based on MTIME and Directories
# PARM1: MTIME
# PARM@: DIR1 DIR2 DIR3 ... DIRn
###################################################################################################

if [[ -z $1 || -z $2 ]]; then
  echo "Usage: housekeep.sh MTIME DIR1 DIR2 DIR3 ... DIRn"
  exit 1
fi

MTIME=$1
if [[ ! $MTIME =~ ^[0-9]+$ ]]; then
  echo "MTIME is not a number: $MTIME"
  exit 1
fi

DIRS=(${@:2})

./app/bin/env.sh
JOBNAME=$(basename $0 | awk -F. '{print $1}')
LOGFILE=$LOGDIR"/"$JOBNAME".log"

if [ ! -f $LOGFILE ]; then
  if [ ! -d $LOGDIR ]; then
    mkdir -p $LOGDIR
  fi
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Creating new log file" | tee $LOGFILE
else
  LOGSIZE=$(ls -l $LOGFILE | awk '{print $5}')
  echo "LOGSIZE: " $LOGSIZE | tee $LOGFILE
  if [ $LOGSIZE -ge $MAXLOGSIZE ]; then
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Archiving log file" | tee -a $LOGFILE
    mv $LOGFILE $LOGFILE.bak
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Creating new log file" | tee $LOGFILE
  fi
fi

echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Job $JOBNAME Started" | tee -a $LOGFILE
echo "PGMDIR:" $PGMDIR | tee -a $LOGFILE
echo "LOGDIR: " $LOGDIR | tee -a $LOGFILE
echo "MAXLOGSIZE: " $MAXLOGSIZ | tee -a $LOGFILE
echo "ALERTMAIL: " $ALERTMAIL | tee -a $LOGFILE
echo "LOGFILE: " $LOGFILE | tee -a $LOGFILE
echo "MTIME: " $MTIME | tee -a $LOGFILE
echo "DIRS: " {$(echo "${DIRS[@]}" | sed 's/ / | /g')} | tee -a $LOGFILE

TOTAL=0
for DIR in "${DIRS[@]}"; do
  if [ ! -d $DIR ]; then
    echo $(date '+%Y%m%d %H:%M:%S') "[WARNNING] Directory doesn't exist: $DIR, housekeep skipped" | tee -a $LOGFILE
    continue
  fi
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Housekeeping directory: $DIR" | tee -a $LOGFILE
  OIFS="$IFS"
  IFS=$'\n'
  COUNT=0
  for FILE in $(find $DIR -mtime +$MTIME -type f); do
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Housekeeping file: $FILE" | tee -a $LOGFILE
    rm -f "$FILE"
    COUNT++
    TOTAL++
  done
  IFS="$OIFS"
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Housekeeping completed for: $DIR, total files deleted: $COUNT" | tee -a $LOGFILE
done
echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Housekeeping completed. total files deleted: $TOTAL" | tee -a $LOGFILE
echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Job $JOBNAME completed successfully" | tee -a $LOGFILE
